import "dotenv/config";

import {
     Client,
     Events,
     GatewayIntentBits,
     REST,
     Routes,
     ChannelType,
} from "discord.js";
import { MusicPlayer } from "./provider";
import { commands } from "./cmd";


const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) throw new Error("DISCORD_TOKEN is missing");
if (!clientId) throw new Error("CLIENT_ID is missing");
if (!guildId) throw new Error("GUILD_ID is missing");

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

client.once(Events.ClientReady, async readyClient => {
     console.log(`Logged in as ${readyClient.user.tag}`);

     const rest = new REST({ version: "10" })
          .setToken(token);

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
});

client.on(
     Events.InteractionCreate,
     async interaction => {
          if (!interaction.isChatInputCommand()) return;

          if (!interaction.guild) {
               await interaction.reply({
                    content:
                         "This command can only be used inside a server.",
                    ephemeral: true,
               });

               return;
          }

          const player: any = getMusicPlayer(
               interaction.guild.id,
          );

          if (interaction.commandName === "join") {
               const member = interaction.member;

               if (
                    !member ||
                    !("voice" in member)
               ) {
                    await interaction.reply(
                         "You must be in a voice channel.",
                    );

                    return;
               }

               const voiceChannel =
                    member.voice.channel;

               if (
                    !voiceChannel ||
                    voiceChannel.type !==
                    ChannelType.GuildVoice
               ) {
                    await interaction.reply(
                         "You must be in a voice channel.",
                    );

                    return;
               }

               player.join(voiceChannel);

               await interaction.reply(
                    "Joined the voice channel.",
               );

               return;
          }

          if (interaction.commandName === "play") {
               try {
                    player.start24_7();

                    await interaction.reply(
                         "24/7 music started.",
                    );
               } catch (error) {
                    await interaction.reply(
                         "Bot must join a voice channel first.",
                    );
               }

               return;
          }

          if (interaction.commandName === "pause") {
               player.pause();

               await interaction.reply("Paused.");

               return;
          }

          if (interaction.commandName === "resume") {
               player.resume();

               await interaction.reply("Resumed.");

               return;
          }

          if (interaction.commandName === "stop") {
               player.stop();

               await interaction.reply(
                    "24/7 music stopped.",
               );

               return;
          }

          if (interaction.commandName === "leave") {
               player.leave();

               await interaction.reply(
                    "Left the voice channel.",
               );

               return;
          }
     },
);

client.login(token);
