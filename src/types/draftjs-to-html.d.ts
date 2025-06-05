declare module 'draftjs-to-html' {
  import { RawDraftContentState } from 'draft-js';
  
  function draftToHtml(content: RawDraftContentState): string;
  export default draftToHtml;
} 