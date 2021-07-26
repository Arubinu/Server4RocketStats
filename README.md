# Server4RocketStats

Create a server for Overlay4RocketStats, allowing easy access to the overlay, while using Socket technology.

__Note__: For the moment this server works only in a terminal.

## Dependencies

To work, you need to install the following dependencies:
 - Node.js: https://nodejs.org
 - Bakkesmod: https://www.bakkesmod.com
 - RocketStats: https://bakkesplugins.com/plugins/view/30
 - Overlay4RocketStats: https://github.com/Arubinu/Overlay4RocketStats

## Installation and Launch

For the overlay to work, it must be placed in a particular location.

1. Open a terminal on the game computer by looking for "Command Prompt" in Windows, then type these commands in the black window (replace the three small dots with the full path to the folder):
 - `cd C:\...\RocketStats_server`
 - `npm install`
 - `node index.js`

2. Still on the gaming computer, open another terminal to find its IP address and write `ipconfig`.
Look at the lines beginning with `IPv4 Address` and save the value written at the end of the line for later (which is the IP address of the computer).
You can close this window.

3. Now add a Browser source and as an address, put the following while replacing `127.0.0.1` by one of the IP addresses found previously then validate:
 - `http://127.0.0.1:3000`

_L'étape 1 est à refaire pour relancer le serveur, afin qu'il soit de nouveau accessible._

__Note__: It is advisable to reserve the IP address found for this user only in the settings of your internet/wifi router (probably in the DHCP section), so that it does not change.

## Basic settings

The following settings can be found in the `RocketStats_server/config.json` file.

 - __port__: The port used by the web/socket server.
 - __delay__: Time between each rank change check (milliseconds).
 - __rocketstats_path__: The path to the `rocketstats` folder (leave empty to use the default path).
