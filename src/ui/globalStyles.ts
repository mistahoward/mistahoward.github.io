import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  html {
    user-select: none;
  }
  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
  }
  .main-color {
    color: #E86100;
  }
  .text-muted {
    color: ${({ theme }) => theme.muted}!important;;
  }
  a {
    color: #E86100;
  }
  a:hover {
    color: #D05700;
  }
  `;

export default GlobalStyles;
