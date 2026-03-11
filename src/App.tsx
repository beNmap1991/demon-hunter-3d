import Game from './game/Game';
import { WebGLErrorBoundary } from './game/WebGLErrorBoundary';

export default function App() {
  return (
    <WebGLErrorBoundary>
      <Game />
    </WebGLErrorBoundary>
  );
}
