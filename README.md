# Polkie Bot

https://discord.com/oauth2/authorize?client_id=[CLIENTID]&scope=bot&permissions=8

## Setup

### Discord

Register your discord bot at the discord developer portal. [Link](https://discord.com/developers/applications)

Click `New Application`

Go into your application,

From the general information tab, copy your `CLIENT ID` and replace [CLIENTID] in the link above. This will be the link for the bot to join your server.

Now in the settings tab click `Bot` and add a bot.

You can customize the bot's username and picture here. Copy your token and place it in the `TOKEN` field of your `config.json`

### MongoDB

Create a MongoDB account [Link](https://www.mongodb.com/)

Create your free cluster

Once your cluster is set up, click `Connect`. Set up your database user, copy down the username and password. Then click `Choose a Connection Method`. Click `Connect your application` and copy the entire string that resembles `mongodb+srv://<username>:<password>@cluster ...` and put it in your `config.json` file in the `MONGO_URI` field.

Replace `<username>` and `<password>` with the database user and password you copied down. Replace `<dbName>` with whatever you want the database to be named.

Make sure you have node.js and npm installed on the machine running this bot.

Check using

`npm -v`

and

`node -v`

Install the dependencies using

`npm i`

Once that's done, compile the TypeScript code using

`tsc` or `npx tsc`

Then:

`npm start`
