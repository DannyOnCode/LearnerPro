// // Inside your frontend button click handler
// const videoUrl = "https://mediaweb.ap.panopto.com/..." // Input from text box
//
// // Call the main process function we wrote above
// const result = await window.electronAPI.invoke('perform-login-and-download', videoUrl);
//
// if (result.success) {
//     alert("Download Complete!");
// } else {
//     alert("Failed: " + result.message);
// }

export default function Session() {
    return (
        <div>
            <h1>Session page</h1>
            <button>Download Video</button>
        </div>
    )
}