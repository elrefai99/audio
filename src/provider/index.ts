import {
     AudioPlayer,
     AudioPlayerStatus,
     AudioResource,
     createAudioPlayer,
     createAudioResource,
     joinVoiceChannel,
     StreamType,
     VoiceConnection,
} from "@discordjs/voice";

import { VoiceChannel } from "discord.js";
import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import { createReadStream } from "node:fs";
import path from "node:path";

export class MusicPlayer {
     private connection: VoiceConnection | null = null;
     private readonly player: AudioPlayer;
     private process: ChildProcessWithoutNullStreams | null = null;

     private readonly songs = [
          "song1.mp3",
          "song2.mp3",
          "song3.mp3",
     ];

     private currentSong = 0;
     private playing24_7 = false;

     constructor() {
          this.player = createAudioPlayer();

          this.player.on(AudioPlayerStatus.Playing, () => {
               console.log("Playing");
          });

          this.player.on(AudioPlayerStatus.Idle, () => {
               console.log("Song finished");

               this.cleanupProcess();

               if (this.playing24_7) {
                    this.playNext();
               }
          });

          this.player.on("error", error => {
               console.error("Audio player error:", error);

               this.cleanupProcess();

               if (this.playing24_7) {
                    setTimeout(() => {
                         this.playNext();
                    }, 1000);
               }
          });
     }

     join(channel: VoiceChannel): void {
          if (this.connection) return;

          this.connection = joinVoiceChannel({
               channelId: channel.id,
               guildId: channel.guild.id,
               adapterCreator: channel.guild.voiceAdapterCreator,
               selfDeaf: true,
          });

          this.connection.subscribe(this.player);

          console.log(`Joined ${channel.name}`);
     }

     start24_7(): void {
          if (!this.connection) {
               throw new Error("Bot is not connected to a voice channel");
          }

          this.playing24_7 = true;

          this.playNext();
     }

     private playNext(): void {
          if (!this.playing24_7) return;

          const fileName = this.songs[this.currentSong];

          this.currentSong =
               (this.currentSong + 1) % this.songs.length;

          const filePath = path.join(
               process.cwd(),
               "audio",
               fileName,
          );

          console.log(`Playing: ${fileName}`);

          this.cleanupProcess();

          const input = createReadStream(filePath);

          const ffmpeg = spawn(
               "ffmpeg",
               [
                    "-hide_banner",
                    "-loglevel",
                    "error",

                    "-i",
                    "pipe:0",

                    "-f",
                    "s16le",
                    "-ar",
                    "48000",
                    "-ac",
                    "2",

                    "pipe:1",
               ],
               {
                    stdio: ["pipe", "pipe", "pipe"],
               },
          );

          this.process = ffmpeg;

          input.pipe(ffmpeg.stdin);

          ffmpeg.stderr.on("data", data => {
               console.error(
                    `FFmpeg: ${data.toString()}`,
               );
          });

          ffmpeg.on("error", error => {
               console.error("FFmpeg error:", error);
          });

          ffmpeg.on("close", code => {
               console.log(`FFmpeg exited: ${code}`);
          });

          const resource: AudioResource = createAudioResource(
               ffmpeg.stdout,
               {
                    inputType: StreamType.Raw,
               },
          );

          this.player.play(resource);
     }

     pause(): boolean {
          return this.player.pause();
     }

     resume(): boolean {
          return this.player.unpause();
     }

     stop(): boolean {
          this.playing24_7 = false;

          this.cleanupProcess();

          return this.player.stop();
     }

     leave(): void {
          this.playing24_7 = false;

          this.cleanupProcess();

          this.player.stop();

          this.connection?.destroy();

          this.connection = null;
     }

     private cleanupProcess(): void {
          if (!this.process) return;

          if (!this.process.killed) {
               this.process.kill();
          }

          this.process = null;
     }
}
