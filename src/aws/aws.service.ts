import {
  Engine,
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
    // Client for text to speech
    this.pollyClient = new PollyClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    // Client for text to S3 Bucket
    this.s3Client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  // Description: Gets Signed URL for the audio to be played.
  // Parameters: bucket key (Path to our file)
  // Steps:
  // 1. Create s3Command
  // 2. Pass s3Client and s3Command to the aws method - getSignedUrl.
  // Return the url received from the method.
  async getAudioUrl(bucketKey: string): Promise<string> {
    const s3Command = new GetObjectCommand({
      Bucket: process.env.AWS_TTS_BUCKET_NAME,
      Key: bucketKey,
    });

    const url = await getSignedUrl(this.s3Client, s3Command, {
      expiresIn: 3600,
    });

    return url;
  }

  // Description: Converts Text to Speech for an article.
  // Parameters: articleId - Article's Id, textContent - Content to be converted
  // Steps:
  // 1. Build a key prefix which is the path to our file
  // 2. Set parameters for StartSpeechSynthesisTaskCommand and build the command
  // 3. Send command to pollyClient to convert text to speech, create an audio file, store the file in our designated s3 bucket
  // 4. Get a signed url leveraging our getAudioUrl method
  // 5. Return audioUrl and bucketKey
  async convertTextToSpeach(articleId: string, textContent: string) {
    try {
      const keyPrefix = `articles/${articleId}`;

      const params = {
        OutputS3BucketName: process.env.AWS_TTS_BUCKET_NAME,
        OutputS3KeyPrefix: keyPrefix,
        OutputFormat: OutputFormat.MP3,
        Text: textContent,
        Engine: Engine.LONG_FORM,
        VoiceId: VoiceId.Ruth,
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
        `${keyPrefix}.${response.SynthesisTask.TaskId}.mp3`,
      );

      return {
        audioUrl,
        bucketKey: `${keyPrefix}.${response.SynthesisTask.TaskId}.mp3`,
      };
    } catch (e) {
      throw new Error(`Something went wrong: ${e}`);
    }
  }
}
