import './index.css';
import React, { useRef, useState } from 'react';
import { render } from 'react-dom';
import { PlateResolvedThreads } from '../src/components/ResolvedThreads/PlateResolvedThreads';
import { Contact, User } from '../src/utils';

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
  comments: [comment, comment, comment],
  isResolved: false,
  createdBy: user,
  assignedTo: user,
};

const App = () => {
  const [textAreaValue, setTextAreaValue] = useState('');
  const [haveContactsBeenClosed, setHaveContactsBeenClosed] = useState(false);

  const textAreaRef = useRef<HTMLBodyElement>(document.body);

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div style={{ margin: '12px' }} ref={ref}>
      <div>Tester</div>
      {/* <PlateThreadComment
        threadLink="facebook.com"
        comment={comment}
        fetchContacts={() => [user]}
        initialValue={textAreaValue}
        onDelete={() => console.log('on delete pressed')}
        onEdit={() => console.log('on edit pressed')}
        onLink={() => console.log('on link pressed')}
        onReOpenThread={() => console.log('on reopen thread')}
        onResolveThread={() => console.log('resolving thread')}
        onValueChange={(value) => setTextAreaValue(value)}
        showLinkButton
        showMoreButton
        showReOpenThreadButton
        showResolveThreadButton
        thread={thread}
        value={textAreaValue}
        onCancel={() => console.log('on cancel')}
        onSave={(value) => console.log(`Saving with ${value}`)}
        onSubmit={() => console.log('submitted')}
        textAreaRef={textAreaRef}
      /> */}
      {/* <PlateThread
        user={user}
        retrieveUser={() => user}
        thread={thread}
        onResolveThread={() => console.log('resolve thread')}
        onReOpenThread={() => console.log('reopen thread')}
        onSave={(value) => console.log(`save with ${value}`)}
        onDelete={() => console.log('delete')}
        fetchContacts={() => [user]}
        onCancel={() => console.log('cancelling comment')}
        onEdit={() => console.log('editing comment')}
        onLink={() => console.log('linking comment')}
        showMoreButton
        showReOpenThreadButton
        showResolveThreadButton
        onSubmitComment={(value, assignedTo) =>
          console.log(`submitting comment with ${value} and ${assignedTo}`)
        }
        value={textAreaValue}
        onValueChange={(value) => setTextAreaValue(value)}
      /> */}
      <PlateResolvedThreads
        onClose={() => console.log('on close')}
        position={{
          top: 0,
          left: 0,
        }}
        resolvedThreads={[thread]}
        retrieveUser={() => user}
        fetchContacts={() => [user]}
        parentRef={ref}
        onReOpenThread={() => console.log('on reopen thread called')}
      />
    </div>
  );
};

render(<App />, document.getElementById('root'));
