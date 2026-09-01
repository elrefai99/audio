import { SlashCommandBuilder } from "discord.js";

export const commands = [
     new SlashCommandBuilder()
          .setName("join")
          .setDescription("Join your voice channel"),

     new SlashCommandBuilder()
          .setName("play")
          .setDescription("Start the 24/7 music"),

     new SlashCommandBuilder()
          .setName("pause")
          .setDescription("Pause the music"),

     new SlashCommandBuilder()
          .setName("resume")
          .setDescription("Resume the music"),

     new SlashCommandBuilder()
          .setName("stop")
          .setDescription("Stop the music"),

     new SlashCommandBuilder()
          .setName("leave")
          .setDescription("Leave the voice channel"),
].map(command => command.toJSON());
