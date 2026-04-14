import { configuration } from '@config/server';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

const configService = configuration();

interface Contact {
  name: string;
  url: string;
  email: string;
}

interface ISwaggerConfig {
  title: string;
  description: string;
  version: string;
  tags: string[];
  contact: Contact;
}

export const SwaggerConfig: ISwaggerConfig = {
  title: configService.name,
  description: 'library-management API',
  version: configService.version,
  tags: [],
  contact: {
    name: '',
    url: configService.server.host,
    email: 'seneralkan77@gmail.com',
  },
};

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const { name, url, email } = SwaggerConfig.contact;
  const builder = new DocumentBuilder()
    .setTitle(SwaggerConfig.title)
    .setContact(name, url, email)
    .setDescription(SwaggerConfig.description)
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' })
    .setVersion(SwaggerConfig.version);
  for (const tag of SwaggerConfig.tags) {
    builder.addTag(tag);
  }
  const options = builder.build();
  return SwaggerModule.createDocument(app, options);
}
