import { useState } from "react";
import './App.css'
import { Mic, Menu } from "lucide-react";


function App() {
    const [urduText, setUrduText] = useState("");
    const [recording, setRecording] = useState(false);
    const [pslOutput, setPslOutput] = useState("");
    const [inputText, setInputText] = useState("");
    const [error, setError] = useState("");
    const isUrduText = (text) => {
        const urduRegex = /^[\u0600-\u06FF\s]+$/; // Regex for Urdu characters
        return urduRegex.test(text);
    };

    // const [pslOutput, setPslOutput] = useState(["/gif1.gif", "/gif2.gif", "/gif3.gif", "/gif4.gif", "/gif5.gif"]);



    // Function to start recording
    const startRecording = async () => {
        setRecording(true);
        const response = await fetch("http://127.0.0.1:5002/start-recording", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ duration: 5 }) 
        });

        if (response.ok) {
            console.log("Recording started...");
            setTimeout(processAudio, 7000); // Wait 6s before processing (extra 1s for buffer)
        } else {
            console.error("Error starting recording");
            setRecording(false);
        }
    };
    const generateGloss = async (urduText) => {
        // if (!urduText) return;
        if (!isUrduText(urduText)){
            setError ("Only Urdu Text is allowed!")
        }
        setError("")
        try {
          const response = await fetch("http://127.0.0.1:5001/generate-psl", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ urdu_text: urduText })
          });
  
          const glossData = await response.json();
          if (glossData.final_psl) {
              console.log("Generated PSL:", glossData.final_psl);
            //   setPslOutput(glossData.final_psl.split(" ")); // Display PSL
              setPslOutput(glossData.final_psl); // Display PSL
          } else {
              console.error("Error in glossing:", glossData.error);
              setPslOutput("Error generating PSL");
          }
      } catch (error) {
          console.error("Failed to fetch gloss:", error);
          setPslOutput("Failed to generate PSL");
      }
  };


    const processAudio = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5002/process-audio", {
                method: "POST",
            });
    
            const data = await response.json();
            if (data.urdu_text) {
                setUrduText(data.urdu_text);
                generateGloss(data.urdu_text);
                console.log("Urdu Text:", data.urdu_text); // Output Urdu text to console
            } else if (data.error) {
                console.error("Error processing audio:", data.error);
                setUrduText("Error: " + data.error); // Display error message
            } else {
                console.error("Unknown error processing audio");
                setUrduText("Unknown error occurred");
            }
        } catch (error) {
            console.error("Failed to fetch:", error);
            setUrduText("Failed to process audio");
        }
        setRecording(false);
    };
    

    
    return (
        <div className="container">
            {/* Navbar */}
            <nav className="navbar">
                <span className="title">Pak Sign</span>
                <Menu className="menu-icon" />
            </nav>

            {/* Content Section */}
            <div className="content">
                {/* Input Section */}
                <div className="input-section">
                    <div className="input-container">
                        <input 
                            type="text" 
                            placeholder="Enter text..." 
                            className="text-input"
                            value = {inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button onClick ={() => generateGloss(inputText)}
                            className = "go-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-check"><path d="m8 11 2 2 4-4"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            
                        </button>
                        <button 
                            onClick={startRecording} 
                            className={`mic-button ${recording ? "recording" : ""}`}
                            disabled={recording}
                        >
                            {recording ? "..." : <Mic className="mic-icon" />}
                        </button>
                    </div>
                    {error && <p style={{ color: "red", marginTop: "5px" }}>{error}</p>}
                </div>
                
                {/* Separator */}
                <div className="separator"></div>

                {/* Output Section */}
                <div className="output-section">
                    <h2 className="output-title">Urdu Output:</h2>
                    <p className="output-text">{urduText || "URDU output will appear here..."}</p>
                    
                    <h2 className="output-title">PSL Gloss Sequence:</h2>
                    <p className="output-text">{pslOutput || "PSL Gloss output will appear here..."}</p>

                    <div className="gif-container">
                        {/* {pslOutput.map((gif, index) => (
                            <img key={index} src={gif} alt={`PSL ${index}`} className="gif-item" />
                        ))} */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
