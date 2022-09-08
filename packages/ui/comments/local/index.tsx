import './index.css';
import React, { useState } from 'react';
import { render } from 'react-dom';
import { PlateThreadLinkDialog } from '../src/components/ThreadLinkDialog/PlateThreadLinkDialog';

const user = {
  id: '1',
  name: 'John Doe',
  email: 'osama@gmail.com',
  avatarUrl: '../osama.jpg',
};

const comment = {
  id: 'any',
  text: 'This is a comment',
  createdAt: 1203912123123,
  createdBy: user,
};

const thread = {
  id: '1',
  comments: [comment],
  isResolved: false,
  createdBy: user,
  assignedTo: user,
};

const App = () => {
  const [textAreaValue, setTextAreaValue] = useState('');
  const [haveContactsBeenClosed, setHaveContactsBeenClosed] = useState(false);
  console.log(haveContactsBeenClosed);
  return (
    <div style={{ margin: '12px' }}>
      <div>Osama</div>
      <PlateThreadLinkDialog
        onClose={() => console.log('closing')}
        threadLink="facebook.com"
      />
    </div>
  );
};

render(<App />, document.getElementById('root'));
