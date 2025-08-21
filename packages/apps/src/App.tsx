import { Link, Routes, Route } from 'react-router-dom';
import Gameplay from './daadi/Gameplay';

type AppEntry = {
  id: string;
  name: string;
  component: React.FC;
};

const appList: AppEntry[] = [
  { id: 'daadi', name: 'Daadi', component: Gameplay },
];

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <div className="p-4">
              <h1 className="text-xl font-bold mb-4">LazySpa Games</h1>
              <ul className="space-y-2">
                {appList.map((app) => (
                  <li key={app.id}>
                    <Link className="text-blue-600 underline" to={`/${app.id}`}>
                      {app.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          }
        />
        {appList.map(({ id, component: Component }) => (
          <Route key={id} path={`/${id}`} element={<Component />} />
        ))}
      </Routes>
    </div>
  );
}

