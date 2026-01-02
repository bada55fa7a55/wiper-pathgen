import { renderToString } from 'solid-js/web';
import { WiperTool } from 'WiperTool';
import './index.css';

export function render() {
  return renderToString(() => <WiperTool />);
}
