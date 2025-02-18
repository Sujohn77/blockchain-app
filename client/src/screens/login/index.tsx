import { Link } from 'react-router-dom';
import { currentUserAtom } from '../../jotai';
import { useAtom } from 'jotai';

const LoginPage = () => {
  const [userInfo, setUserInfo] = useAtom(currentUserAtom);
  const { username, chatId } = userInfo;

  return (
    <div>
      <h2 className="mb-3 text-2xl">Blockchain chat</h2>
      <form className="flex flex-col gap-3">
        <input
          className="p-1"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUserInfo({ ...userInfo, username: e.target.value });
          }}
        />
        <input
          className="p-1"
          type="number"
          placeholder="Chat ID"
          value={`${chatId}`}
          onChange={(e) => {
            setUserInfo({ ...userInfo, chatId: Number(e.target.value) });
          }}
        />

        <Link to={`/chat/${userInfo.chatId}`}>Next</Link>
      </form>
    </div>
  );
};

export default LoginPage;
