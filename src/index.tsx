/* @refresh reload */
import { WiperTool } from 'WiperTool';
import { render } from 'solid-js/web';
import './index.css';

const root = document.getElementById('root');

render(
  () => (
    <>
      <WiperTool />
    </>
  ),
  root!,
);
