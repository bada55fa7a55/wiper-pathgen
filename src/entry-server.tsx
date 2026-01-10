import { WiperTool } from 'WiperTool';
import { renderToString } from 'solid-js/web';
import { extractCss } from 'solid-styled-components';
import './index.css';

export function render() {
  const appHtml = renderToString(() => <WiperTool />);
  const styles = extractCss();

  return {
    html: appHtml,
    styles: styles ? `<style id="_goober">${styles}</style>` : '',
  };
}
