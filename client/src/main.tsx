import './index.css';
import { createRoot } from 'react-dom/client';

import 'react-toastify/dist/ReactToastify.css';

import App from './App';

// eslint-disable-next-line @typescript-eslint/no-var-requires

createRoot(document.getElementById('root')!).render(<App />);
