import {
     AudioPlayer,
     AudioPlayerStatus,
     AudioResource,
     VoiceConnection,
     createAudioPlayer,
     createAudioResource,
     joinVoiceChannel,
} from "@discordjs/voice";

import {
     VoiceChannel,
} from "discord.js";

export class MusicPlayer {
     private connection: VoiceConnection | null = null;

     private readonly player: AudioPlayer;

     private resource: AudioResource | null = null;

     constructor() {
          this.player = createAudioPlayer();

          this.player.on(
               AudioPlayerStatus.Playing,
               () => {
                    console.log("Playing");
               },
          );

          this.player.on(
               AudioPlayerStatus.Idle,
               () => {
                    console.log("Player idle");
               },
          );

          this.player.on(
               "error",
               error => {
                    console.error("Audio player error:", error);
               },
          );
     }

     join(channel: VoiceChannel): void {
          this.connection = joinVoiceChannel({
               channelId: channel.id,
               guildId: channel.guild.id,
               adapterCreator: channel.guild.voiceAdapterCreator,
          });

          this.connection.subscribe(this.player);
     }

     play(url: string): void {
          this.resource = createAudioResource(url);

          this.player.play(this.resource);
     }

     pause(): boolean {
          return this.player.pause();
     }

     resume(): boolean {
          return this.player.unpause();
     }

     stop(): boolean {
          return this.player.stop();
     }

     leave(): void {
          this.player.stop();

          this.connection?.destroy();

          this.connection = null;
          this.resource = null;
     }

     get isPlaying(): boolean {
          return this.player.state.status === AudioPlayerStatus.Playing;
     }
}
