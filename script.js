const APP_ID = 'finalproject-pkocsot';
const ATLAS_SERVICE = 'mongodb-atlas';
const app = new Realm.App({ id: APP_ID });

let user_id = null;
let mongodb = null;
let coll = null;

// Function executed by the LOGIN button.
const login = async () => {
    const email = $('#email').val();
    const password = $('#password').val();
    const credentials = Realm.Credentials.emailPassword(email, password);
    try {
        const user = await app.logIn(credentials);
        $('#userid').empty().append(`Logged in as: ${user.id}`); // update the user div with the user ID
        user_id = user.id;
        mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        coll = mongodb.db("rangers-base").collection("rangers-roster");
        await find_players(); // Call find_players after logging in to display players
    } catch (err) {
        console.error("Failed to log in", err);
    }
};

// Function executed by the INSERT button.
const insert_player = async () => {
    console.log("INSERT");
    const name = $('#name-input').val();
    const number = $('#number-input').val();
    const position = $('#position-input').val();

    try {
        await coll.insertOne({ name, number, position });
        await find_players(); // Refresh the list after insertion
    } catch (err) {
        console.error("Failed to insert player", err);
    }
};

// Function to delete a player
const delete_player = async (name) => {
    console.log("DELETE", name);
    try {
        await coll.deleteOne({ name });
        await find_players(); // Refresh the list after deletion
    } catch (err) {
        console.error("Failed to delete player", err);
    }
};

// Function to retrieve and display players
const find_players = async () => {
    if (mongodb == null || coll == null) {
        $("#userid").empty().append("Need to login first.");
        console.error("Need to log in first");
        return;
    }

    try {
        const players = await coll.find({}, {
            "projection": {
                "_id": 0,
                "name": 1,
                "number": 1,
                "position": 1
            }
        });

        // Access the players div and clear it.
        let players_div = $("#players");
        players_div.empty();

        // Loop through the players and display them in the players div.
        for (const player of players) {
            let playerDiv = document.createElement("div");
            playerDiv.classList.add('card', 'mb-2', 'p-2');

            let playerInfo = document.createElement("p");
            playerInfo.classList.add('card-text');
            playerInfo.append(`${player.name} - ${player.position} - #${player.number}`);

            // Create delete button
            let deleteButton = document.createElement("button");
            deleteButton.classList.add('btn', 'btn-danger', 'ml-2');
            deleteButton.innerHTML = '<i class="fas fa-times"></i>';
            deleteButton.onclick = () => delete_player(player.name);

            playerDiv.append(playerInfo);
            playerDiv.append(deleteButton);
            players_div.append(playerDiv);
        }
    } catch (err) {
        console.error("Failed to retrieve players", err);
    }
};

// Ensure that buttons are linked to the appropriate functions
$('#login-button').click(login);
$('#insert-button').click(insert_player);
