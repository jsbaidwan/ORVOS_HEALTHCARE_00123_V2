import pako from 'pako';

const uploadUrl = `${process.env.REACT_APP_API_URL}/${process.env.REACT_APP_API_NAME}/api/ckeditor/upload`;

const parseFroalaResponse = (response) => {
  try {
    return JSON.parse(response);
  } catch (e) {
    try {
      const bytes = Uint8Array.from(
        atob(response.trim()),
        (c) => c.charCodeAt(0)
      );

      const decompressed = pako.inflate(bytes, { to: 'string' });

      return JSON.parse(decompressed);
    } catch (err) {
      console.error('Failed to parse Froala response', err);
      return {};
    }
  }
};

export const getFroalaConfig = (getToken) => ({
  key: 'Ig1A7vC3C2D3B1E2H5E4H4B15A11A7D7D6G4H4E3F3C7C7A6E6E2B2C-8TMIBDIa1NTMNZFFPFZc1d1Ib2a1E1fONTh1SA5A4D4A2E4C2A2E3E1B3==',
  placeholderText: 'Type something',
  charCounterCount: true,

  toolbarButtons: {
    moreText: {
      buttons: [
        'bold',
        'italic',
        'underline',
        'strikeThrough',
        'subscript',
        'superscript',
        'fontFamily',
        'fontSize',
        'textColor',
        'backgroundColor',
        'inlineClass',
        'inlineStyle',
        'clearFormatting',
      ],
    },
    moreParagraph: {
      buttons: [
        'alignLeft',
        'alignCenter',
        'alignRight',
        'alignJustify',
        'formatOLSimple',
        'formatOL',
        'formatUL',
        'paragraphFormat',
        'paragraphStyle',
        'lineHeight',
        'outdent',
        'indent',
        'quote',
      ],
    },
    moreRich: {
      buttons: [
        'insertLink',
        'insertImage',
        'insertVideo',
        'insertTable',
        'emoticons',
        'fontAwesome',
        'specialCharacters',
        'embedly',
        'insertFile',
        'insertHR',
      ],
    },
    moreMisc: {
      buttons: [
        'undo',
        'redo',
        'fullscreen',
        'print',
        'getPDF',
        'spellChecker',
        'selectAll',
        'html',
        'help',
      ],
      align: 'right',
      buttonsVisible: 2,
    },
  },

  heightMin: 200,
  heightMax: 400,

  imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'],

  imageUploadURL: uploadUrl,
  imageUploadParam: 'file',
  imageUploadMethod: 'POST',

  videoUploadURL: uploadUrl,
  videoUploadParam: 'file',
  videoUploadMethod: 'POST',

  fileUploadURL: uploadUrl,
  fileUploadParam: 'file',
  fileUploadMethod: 'POST',

  requestHeaders: {
    Authorization: `Bearer ${getToken()}`,
  },
 
  events: {
 
    'image.uploaded': function (response) {
      const json = parseFroalaResponse(response);

      if (json.url) {
        this.image.insert(json.url, null, null, this.image.get());
      }

      return false;
    },

    'video.uploaded': function (response) {
      const json = parseFroalaResponse(response);

      if (json.url) {
        this.video.insert(
          `<video src="${json.url}" controls width="600"></video>`
        );
      }

      return false;
    },

    'file.uploaded': function (response) {
      const json = parseFroalaResponse(response);

      if (json.url) {
        this.file.insert(
          json.url,
          json.url.split('/').pop(),
          null
        );
      }

      return false;
    },

    'image.error': function (error, response) {
      console.error('Froala Image Error:', error);
      console.error('Response:', response);
    },
  },
});