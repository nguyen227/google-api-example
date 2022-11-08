import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GoogleApiService } from './google-api/google-api.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly googleApiService: GoogleApiService) {}

  // @Get('/test')
  // testGoogleApi() {
  //   return this.googleApiService.createForm();
  // }

  @Get('/test')
  test() {
    return this.googleApiService.test();
  }
  @Get('/chat')
  testGooleChat() {
    return this.googleApiService.chat('Hehe');
  }

  @Get('/getListmember')
  listMember() {
    return this.googleApiService.listMember();
  }

  @Get('/readListmember')
  readListMember() {
    return this.googleApiService.readSpreadSheet();
  }

  @Post('/c5chatbot')
  nghePost(@Body() body: any) {
    return this.googleApiService.interactWithBot(body);
  }
  @Get('/photo/:userId')
  helllo(@Param('userId') userId: string) {
    return this.googleApiService.getUserPhotoUrl(userId);
  }

  @Get('/readFile')
  readFile() {
    return this.googleApiService.readFile();
  }

  @Get('/write_from_file')
  writeFromFile() {
    return this.googleApiService.writeSpreadSheetFromFile();
  }
}
