import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { chat_v1, drive_v3, google, people_v1, sheets_v4 } from 'googleapis';
import { join } from 'path';
import * as fs from 'fs';
import { Cron } from '@nestjs/schedule';

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/chat.bot',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/user.emails.read',
  'https://www.googleapis.com/auth/user.birthday.read',
  'https://www.googleapis.com/auth/userinfo.email',
];

const IMAGES = [
  'https://media2.giphy.com/media/3oEjHK3aw2LcB1V3QQ/giphy.gif',
  'https://media3.giphy.com/media/l0HlUIHlH4AKadXzy/giphy.gif',
  'https://media0.giphy.com/media/3otPorfb8Lu7wjKllm/giphy.gif',
  'https://media3.giphy.com/media/xT9IgFLBcm3Wi6l6qA/giphy.gif',
];

const spaceId = 'spaces/AAAAfA76OtU'; //? Backend (C5 Web - 26/10)
// const spaceId = 'spaces/AAAAN57mk9c'; //? C5 - Website 26/10 - Dev
// const spaceId = 'spaces/AAAAp0V4p6c'; //? C5 All

const spreadSheetId = '1hUqMpu1_m7Lh8HBs4s8dh9KWjaZfFJNWDM5hXyhYcNU'; //? C5 List Member
const driveFolderId = '1di9XFd6KS4cIUN-DydFaGWoEV2x-afiK'; //? C5 - Website/Images

@Injectable()
export class GoogleApiService {
  private auth = new google.auth.GoogleAuth({
    keyFile: join(__dirname, './keys/c5bot-credentials.json'),
    scopes: SCOPES,
  });
  private chatService: chat_v1.Chat;
  private sheetService: sheets_v4.Sheets;
  private peopleService: people_v1.People;
  private driveService: drive_v3.Drive;

  constructor() {
    this.chatService = google.chat({ version: 'v1', auth: this.auth });
    this.sheetService = google.sheets({ version: 'v4', auth: this.auth });
    this.peopleService = google.people({ version: 'v1', auth: this.auth });
    this.driveService = google.drive({ version: 'v3', auth: this.auth });
  }

  async test() {
    // const result = await this.driveService.files.list({ spaces: 'drive' });
    const result = await this.driveService.files.list({
      spaces: `drive`,
      q: `'${driveFolderId}' in parents`,
      fields: 'files',
    });

    const imagedata = await this.driveService.files.get({
      fileId: result.data.files[0].id,
      fields: 'thumbnailLink',
    });
    // return imagedata.data;
    return result.data;
  }

  async createForm() {
    const auth = new google.auth.GoogleAuth({
      keyFile: join(__dirname, './keys/credentials.json'),
      scopes: SCOPES,
    });
    // const forms = google.forms({
    //   version: 'v1',
    //   auth,
    // });
    // const newForm: forms_v1.Schema$Form = {
    //   info: { title: 'Creating a new form in Node', documentTitle: 'New Form Create' },
    // };
    // const res = await forms.forms.create({ requestBody: newForm });

    const drive = google.drive({ version: 'v3', auth: auth });
    const driveAbout = await drive.files.create({
      requestBody: { name: 'hihi', parents: ['1KdGehGQ6FS9FdJjqaHU2Vxo-geLqCxfP'] },
      media: { mimeType: 'application/json', body: createReadStream(join(__dirname, './keys/credentials.json')) },
      fields: 'id, name',
    });
    return driveAbout;
  }

  // @Cron('10 * * * * *')
  async chat(message) {
    const result = await this.chatService.spaces.messages.create({
      parent: spaceId,
      requestBody: {
        text: '<users/all>',
        cardsV2: [
          {
            cardId: 'image',
            card: {
              header: { title: 'Request Image' },
              sections: [
                {
                  widgets: [
                    {
                      image: {
                        imageUrl:
                          'https://lh3.googleusercontent.com/fife/AAbDypD0Lzx5kLeT5eI9OoEY18g-HtSBGZda_Ev1ZTxFEvkXaJDAkhB6JU9AfjoVuVIkfi6msoqkgeN-Po9yGKl4u5V_WcyMYb04lUzi3-1sicAR5K9yMPGchJ3Fr3hvftcUu7IvOyAsPAJrsoNO3BoUUYHZJUfY3VKFS5B1Uw5uYInJdhA4UHowm2YwMl-z0SNopokKyC0aEUnkzkUYcuKZfLbrJssqwhvM2T4A-nseahQSDg-g_PQjy3gBHN9bsnk0yYcRLbSbpCzLxVr-JH8mCXFwqA6HKUaEh_nvU9VlqaPd2OfIiZpCx-ZAc00NqKLoO48N_oAyMESVZxppNj3SBq2Rl7Ji9KKPJhC_zd3-knfHWx6oOw0wE_GI00fbgWKS2alsRQDT2BKgxkgYS9P1LmYUylynkwPQfAsF-WDPAu86kPBsSfEbAp4lp3pKDF6769_U4JT5biiLhDqngLFdtHpBgDYXTzlskI9VMzpL0xm5Fx2rb5M2oA5Sl90xAtdkwIKau9HiJT-QApzvY_nn1mBF2prGcveI3Wd4UjX869Jcfsb-Nv7eLvoXz5Ij3XCssA_NQ_7vUNlBtVZ0W5PcDVXusdQsVqZtS6oK7C2_p6V3nJ9KPI1hABD8R6G-Yuvoi_NHxV1MGFbdvMduzLR0QlfXni3-Em6drUXhcI_01zvvutBqLb5Ha0CzB_56Wf2JTP0VSJNqOWQsaPfSQEiQif3boRycK-C1cyPnYdpfjFLoDip4yag05dDqyU2PSkPrCEQ-A2yZ0RV6iXm3ABaedETty4NmpsM-yn2fTza17aWtHHCyAcTX73F2qA5C_53Lwbzi0K4vGD8rIWOKGRn-rEUfyCYL7t_vgE_ZW83IVBzfB2iCkEoGiqTuEeMUk40WnAzRTj2vrmjV9fjO9SR3_j98HsA2b8VZpEsaqmnSbB1uXTeNnmspv3Zii9BxMtyJX6UcRwqq1S0SxUxxu1x4ZXxlFfdDoirqlVbXyt0AJSn3XbJBcDQ74qs8jtF4XKPzCb0K1d1FU6z9CqDZwDK1selEPm5T8AtXn9clnAdXFIQoMyg1-lhyhHwAtj3oWG_E4HMhQBG15MuXtC8IrfgjGKdwC4ctkITBpBLDWB9-NOCRSOBo6CS5t16-JwsTSj3p92WOmy2KNVI7UcCwN3uXNyjSXHvHvtRy2i5h89zbWBw-5fDejl-Dj-KNeiqNv7Tj-U0O-LPIV8K4AanwSEIQVS0GR9-7hKhJoJji6kmWCpdQaIfKZqhvpoEy06WwlegNGOp11GWnZ_LW8mACytdvDUjPczWo8qhO5FfpDkmstNtZz_9xnSLwlNhTXuQtMKoKbNuwiEtWzg72icwLEA-CW6c00yE_BaxbDncDbQfQ3ORisut9hH3K2OmhSI_XeLkRe9kgqM6YwSzhD4WZvJUzE-N4T8bG8CZDteui9Ne66KbJR7TIwbshtfxePs0SSHYMazX3etNlVjgOqtq_mj4',
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    });
    return result;
  }

  async listMember() {
    const result = await this.chatService.spaces.members.list({ parent: spaceId });

    const listMember = [];
    for await (const member of result.data.memberships) {
      const userID = member.member.name.replace('users/', '');
      const photoUrl = await this.getUserPhotoUrl(userID);
      if (member.state === 'JOINED') {
        listMember.push({ userID, displayName: member.member.displayName, photoUrl });
      }
    }
    this.writeSpreadSheet(listMember);
    return result.data;
  }

  async writeSpreadSheet(data: object[]) {
    const fields = Object.keys(data[0]);
    const mappedValues = data.map((item) => Object.values(item));
    const values: string[][] = [fields, ...mappedValues];
    const valueCount = values.length;
    const deepestRow = 200;
    const letterBegin = 'A';
    const letterEnd = 'H';
    this.sheetService.spreadsheets.values.update({
      spreadsheetId: spreadSheetId,
      range: `${letterBegin}1:${letterEnd}${deepestRow}`,
      requestBody: { values },
      valueInputOption: 'USER_ENTERED',
    });

    for (let i = valueCount; i < deepestRow; i++) {
      this.sheetService.spreadsheets.values.update({
        spreadsheetId: spreadSheetId,
        range: `${letterBegin}${i}:${letterEnd}${i}`,
        requestBody: { values: [Array(letterEnd.charCodeAt(0) - letterBegin.charCodeAt(0)).fill('')] },
        valueInputOption: 'USER_ENTERED',
      });
    }

    return { message: 'update successful' };
  }

  async readSpreadSheet() {
    const response = await this.sheetService.spreadsheets.values.get({ spreadsheetId: spreadSheetId, range: 'A1:C10' });

    const data = response.data.values;

    const fields = data.shift();
    const values = data;
    const objArr = [];

    values.forEach((valueArr) => {
      const tempObject = {};
      valueArr.forEach((value, index) => {
        tempObject[`${fields[index]}`] = value;
      });
      objArr.push(tempObject);
    });

    return objArr;
  }

  async interactWithBot(body) {
    if (body.type === 'MESSAGE') {
      console.log(body.message);
      if (body.message.slashCommand) {
        switch (body.message.slashCommand.commandId) {
          case '1': {
            console.log('/slash commnand');
            return {
              text: 'You need help?',
            };
          }
        }
      }
      const sender = body.message.sender;
      const senderMessage = body.message.argumentText.trim().toLowerCase();

      if (senderMessage === 'hello') {
        return {
          text: `Hi <${sender.name}>, have a good day!`,
        };
      } else if (senderMessage === 'my avatar') {
        const response = this.myAvatar(sender.name, sender.avatarUrl);
        return {
          text: `<${sender.name}>, Your avatar picture:`,
          ...response,
        };
      } else if (senderMessage === 'vote') {
        const message = this.createMessage('nobody', 0, false);
        return message;
      } else {
        return {
          text: `<${sender.name}> Sorry, I don't understand`,
        };
      }
    }

    if (body.type === 'ADDED_TO_SPACE') {
      return {
        text: `<users/all> Hello everyone! I'm C5 Chat Bot, glad to see you guys here!`,
      };
    }
    if (body.type == 'CARD_CLICKED') {
      // Update the card in place when the "UPVOTE" button is clicked.
      if (body.action.actionMethodName == 'upvote') {
        const count = parseInt(body.action.parameters[0].value);
        const message = this.createMessage(body.user.displayName, count + 1, true);
        return message;
      }

      // Create a new vote when the "NEW VOTE" button is clicked.
      if (body.action.actionMethodName == 'newvote') {
        const message = this.createMessage(body.user.displayName, 0, false);
        return message;
      }
    }
  }

  async getUserPhotoUrl(userID: string) {
    const profile = await this.peopleService.people.get({
      resourceName: `people/${userID}`,
      personFields: 'photos,emailAddresses,birthdays,memberships',
    });
    const photoUrl = profile.data.photos[0].url + '00';
    return profile.data;
  }

  async readFile() {
    const fileData = fs.readFileSync(__dirname + '/keys/c5-all-members.json', 'utf-8');
    // return fileData;
    const data = JSON.parse(fileData);
    return data;
  }

  async writeSpreadSheetFromFile() {
    const data = await this.readFile();
    this.writeSpreadSheet(data);
    return data;
  }

  createMessage(voter, count, update) {
    return {
      actionResponse: { type: update ? 'UPDATE_MESSAGE' : 'NEW_MESSAGE' },
      cards: [
        {
          header: { title: `Last vote by ${voter}!` },
          sections: [
            {
              widgets: [
                {
                  textParagraph: { text: `${count} votes!` },
                },
                {
                  image: { imageUrl: IMAGES[count % IMAGES.length] },
                },
                {
                  buttons: [
                    {
                      textButton: {
                        text: 'UPVOTE',
                        onClick: {
                          action: {
                            actionMethodName: 'upvote',
                            parameters: [
                              {
                                key: 'count',
                                value: `${count}`,
                              },
                            ],
                          },
                        },
                      },
                    },
                    {
                      textButton: {
                        text: 'NEW VOTE',
                        onClick: {
                          action: {
                            actionMethodName: 'newvote',
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  myAvatar(name, imageURL) {
    const avatarImageWidget = {
      image: { imageUrl: imageURL },
    };

    const avatarSection = {
      widgets: [avatarImageWidget],
    };

    return {
      cards: [
        {
          name: 'Avatar Card',
          sections: [avatarSection],
        },
      ],
    };
  }
}
