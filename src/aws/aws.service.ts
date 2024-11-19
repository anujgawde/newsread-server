import {
  OutputFormat,
  PollyClient,
  StartSpeechSynthesisTaskCommand,
  VoiceId,
} from '@aws-sdk/client-polly';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AwsService {
  pollyClient: PollyClient;
  s3Client: S3Client;
  constructor() {
    this.pollyClient = new PollyClient({
      region: 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.s3Client = new S3Client({
      region: 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async getAudioUrl(keyPrefix: string, taskId: string): Promise<string> {
    const s3Command = new GetObjectCommand({
      Bucket: process.env.AWS_TTS_BUCKET_NAME,
      Key: `${keyPrefix}.${taskId}.mp3`,
    });

    const url = await getSignedUrl(this.s3Client, s3Command, {
      expiresIn: 3600,
    });

    return url;
  }

  async convertTextToSpeach(articleId: string, articleContent: string) {
    try {
      const keyPrefix = `articles/${articleId}`;

      const params = {
        OutputS3BucketName: process.env.AWS_TTS_BUCKET_NAME,
        OutputS3KeyPrefix: keyPrefix,
        OutputFormat: OutputFormat.MP3, // Options: 'mp3', 'ogg_vorbis', 'pcm'
        Text: articleContent,
        VoiceId: VoiceId.Joanna,
      };

      // Start speech synthesis task
      const command = new StartSpeechSynthesisTaskCommand(params);
      const response = await this.pollyClient.send(command);

      if (!response.SynthesisTask || !response.SynthesisTask.OutputUri) {
        throw new Error(
          'Speech synthesis task failed or no output URI available',
        );
      }

      const audioUrl = await this.getAudioUrl(
        keyPrefix,
        response.SynthesisTask.TaskId,
      );

      return audioUrl;
    } catch (e) {
      throw new Error(`Something went wrong: ${e}`);
    }
  }
}
