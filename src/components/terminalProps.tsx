import Prompt from './prompt';

// Properties function
interface TerminalProps {
	// The text that will be displayed in the terminal
	prompt: Prompt;
	// The title of the terminal window
	title: string;
	// The type of terminal window (macos/windows/linux)
	os: string;
}

export default TerminalProps;