import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { awsConfig } from './aws-config';
import TodoList from './components/TodoList';
import './App.css';

Amplify.configure(awsConfig);

function App() {
  return (
    <div className="App">
      <Authenticator>
        {({ signOut, user }) => (
          <main>
            <header className="app-header">
              <h1>Todo App</h1>
              <div className="user-info">
                <span>Welcome, {user?.username}</span>
                <button onClick={signOut} className="sign-out-btn">
                  Sign Out
                </button>
              </div>
            </header>
            <TodoList />
          </main>
        )}
      </Authenticator>
    </div>
  );
}

export default App;