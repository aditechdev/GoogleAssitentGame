import { GAGPage } from './app.po';

describe('gag App', () => {
  let page: GAGPage;

  beforeEach(() => {
    page = new GAGPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
