import"./App.css"
import { Button } from "@/components/ui/button"
import io from 'socket.io-client'
import { useState , useEffect} from "react";
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



import { Input } from "@/components/ui/input"
import { SidebarProvider } from "./components/ui/sidebar";
import { Editor } from "@monaco-editor/react";
import { Home } from "lucide-react";




const socket = io('https://collab-code-editer.onrender.com');

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
  const [version,setVersion]=useState("*");


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

    socket.on("codeResponse",(response)=>{
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

 const runCode=()=>{
  socket.emit("compileCode",{code,roomId,language,version});
 }

 const clearConsole=()=>{
  setOutput(" ");
 }


   if(!joined) {
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
</div>
    <Input type="Text" 
      placeholder="Your Name"
      value={userName}
      onChange={(e) => setUserName(e.target.value)}
    />
</div>

  </CardContent>
  <CardFooter className="mt-5">
    <Button onClick={joinRoom} className=" w-full"> Join Room</Button>
  </CardFooter>
</Card>
  )
}

  return (
    <div className="editor-container  ">
      <div className="sidebar ml-0.5 my-0.5 rounded-sm bg-zinc-800">
        <div className="room-info">
          <h2>Code Room: {roomId}</h2>
          <button onClick={copyRoomId} className="copy-button">
            Copy Id
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <h3>Users in Room:</h3>
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
        <div className="flex gap-2 ml-0.5 ">
        <Button className="run-button my-1 ml-0.1 bg-green-600 " onClick={runCode}>Execute</Button>
          <Button className=" my-1 " variant="" onClick={clearConsole}> clear console</Button>
        </div>
        <Textarea className=" grow min-w-45 bg-zinc-800 text-white h-60"
         readOnly 
         value={output}
         placeholder="Output Console"
         >

        </Textarea>
      </div>
    </div>
  );
};
export default App ;
