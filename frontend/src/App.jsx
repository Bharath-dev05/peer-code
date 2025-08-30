import "./App.css"
import { Button } from "@/components/ui/button"
import io from 'socket.io-client'
import { useState, useEffect } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,

} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { SquareChevronRight } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Editor } from "@monaco-editor/react";
import { PlayIcon, Copy, LogOut, Users } from "lucide-react";
import { v4 as uuid } from "uuid";







const socket = io('https://collab-code-editer.onrender.com/');

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [output, setOutput] = useState("");
  const [version, setVersion] = useState("*");


  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });


    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is Typing`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("codeResponse", (response) => {
      setOutput(response.run.output);
    })


    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// start code here");
    setLanguage("javascript");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const [userInput, setUserInput] = useState("");

  //compiling
  const runCode = () => {
    socket.emit("compileCode", { code, roomId, language, version, input: userInput });
  }

  const clearConsole = () => {
    setOutput(" ");
  }

  const createRoomId = () => {
    const roomId = uuid();
    setRoomId(roomId);
  }

  if (!joined) {
    return (
      <Card className=" w-full rounded-4xl bg-gray-100  h-96 mt-36 mx-auto  max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-4xl">Join Room</CardTitle>
          <CardDescription className="text-center text-lg">create or join room to Collaborate</CardDescription>

        </CardHeader>
        <CardContent className="flex ">
          <div className="flex flex-col gap-8 w-full">
            <div className="grid gap-2 ">
              <Input className="" type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <Button className="mt-4" onClick={createRoomId}>Generate ID</Button>
            </div>

            <Input className="mt-0.5" type="Text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

        </CardContent>
        <CardFooter className="mt-3">
          <Button onClick={joinRoom} className=" w-full">
            Join Room
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="editor-container  ">
      <div className="sidebar ml-0.5 my-0.5 rounded-sm bg-zinc-800">
        <div className="room-info">
          <h2>Code Room: {roomId}</h2>
          <Button onClick={copyRoomId} className="copy-button">
            Copy Id
            <Copy className="h-4 w-4 " />
          </Button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <h3 className="inline-flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Active Users:</span>
        </h3>

        <ul>
          {users.map((user, index) => (

            <li key={index}>{user.slice(0, 8)}...</li>
          ))}
        </ul>
        <p className="typing-indicator">{typing}</p>
        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <Button className="leave-button" onClick={leaveRoom}>
          Leave Room
          <LogOut className="h-4 w-4 " />
        </Button>
      </div>

      <div className="editor-wrapper  flex flex-col w-full mt-0.5 mx-0.5">
        <Editor
          className="ml-0.5 "
          height={"60%"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
        <div className=" ml-0.5 flex bg-zinc-800 mt-0.5 rounded-sm h-10 items-center ">
          <Button className="run-button text-white my-1 ml-0.5 bg-green-600 " variant="ghost" onClick={runCode}>

            <PlayIcon className="h-4 w-4 " />
            Execute

          </Button>
          <Button className=" my-1  ml-1 text-white" variant="ghost" onClick={clearConsole}>
            <SquareChevronRight className="h-4 w-4 " />
            Clear Console</Button>
        </div>
        <div className="flex flex-row gap-1 ml-0.5 ">
          <Textarea className=" grow w-56 bg-zinc-800 text-white h-60"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Input..."
          ></Textarea>

          <Textarea className=" grow min-w-45 bg-zinc-800 text-white h-60"
            readOnly
            value={output}
            placeholder="Output Console"
          ></Textarea>
        </div>



      </div>
    </div>
  );
};
export default App;
