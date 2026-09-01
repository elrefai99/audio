import "dotenv/config";

import {
     Client,
     Events,
     GatewayIntentBits,
     REST,
     Routes,
} from "discord.js";
import { MusicPlayer } from "./provider";
import { commands } from "./cmd";


const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
     throw new Error("DISCORD_TOKEN is missing");
}

if (!clientId) {
     throw new Error("CLIENT_ID is missing");
}

if (!guildId) {
     throw new Error("GUILD_ID is missing");
}

const client = new Client({
     intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildVoiceStates,
     ],
});

const musicPlayers = new Map<string, MusicPlayer>();

function getMusicPlayer(guildId: string): MusicPlayer {
     let player = musicPlayers.get(guildId);

     if (!player) {
          player = new MusicPlayer();

          musicPlayers.set(guildId, player);
     }

     return player;
}

client.once(
     Events.ClientReady,
     async readyClient => {
          console.log(
               `Logged in as ${readyClient.user.tag}`,
          );

          const rest = new REST({
               version: "10",
          }).setToken(token);

          await rest.put(
               Routes.applicationGuildCommands(
                    clientId,
                    guildId,
               ),
               {
                    body: commands,
               },
          );

          console.log("Slash commands registered");
     },
);

client.on(
     Events.InteractionCreate,
     async interaction => {
          if (!interaction.isChatInputCommand()) {
               return;
          }

          const guild = interaction.guild;

          if (!guild) {
               await interaction.reply({
                    content: "This command can only be used inside a server.",
                    ephemeral: true,
               });

               return;
          }

          const player = getMusicPlayer(guild.id);

          switch (interaction.commandName) {
               case "join": {
                    const member: any = interaction.member;

                    if (
                         !("voice" in member) ||
                         !member.voice.channel
                    ) {
                         await interaction.reply({
                              content: "You need to join a voice channel first.",
                              ephemeral: true,
                         });

                         return;
                    }

                    const channel = member.voice.channel;

                    if (channel.type !== 2) {
                         await interaction.reply({
                              content: "This is not a voice channel.",
                              ephemeral: true,
                         });

                         return;
                    }

                    player.join(channel);

                    await interaction.reply(
                         `Joined ${channel.name}`,
                    );

                    break;
               }

               case "play": {
                    const member: any = interaction.member;

                    if (
                         !("voice" in member) ||
                         !member.voice.channel
                    ) {
                         await interaction.reply({
                              content: "Join a voice channel first.",
                              ephemeral: true,
                         });

                         return;
                    }

                    const channel = member.voice.channel;

                    if (channel.type !== 2) {
                         await interaction.reply({
                              content: "This is not a voice channel.",
                              ephemeral: true,
                         });

                         return;
                    }

                    const url = interaction.options.getString(
                         "url",
                         true,
                    );

                    player.join(channel);

                    try {
                         player.play(url);

                         await interaction.reply(
                              `Playing: ${url}`,
                         );
                    } catch (error) {
                         console.error(error);

                         await interaction.reply({
                              content: "Failed to play this audio.",
                              ephemeral: true,
                         });
                    }

                    break;
               }

               case "pause": {
                    const paused = player.pause();

                    await interaction.reply(
                         paused
                              ? "Music paused."
                              : "Nothing is currently playing.",
                    );

                    break;
               }

               case "resume": {
                    const resumed = player.resume();

                    await interaction.reply(
                         resumed
                              ? "Music resumed."
                              : "Music is not paused.",
                    );

                    break;
               }

               case "stop": {
                    const stopped = player.stop();

                    await interaction.reply(
                         stopped
                              ? "Music stopped."
                              : "Nothing is currently playing.",
                    );

                    break;
               }

               case "leave": {
                    player.leave();

                    await interaction.reply(
                         "Left the voice channel.",
                    );

                    break;
               }
          }
     },
);

client.login(token);
