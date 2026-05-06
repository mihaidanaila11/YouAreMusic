interface ButtonProps {
    children?: React.ReactNode;
    onClick?: () => void;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
    
}

const Button = ({ children, onClick, onMouseDown, onMouseUp }: ButtonProps) => {
    return (
        <div>
        <button onClick={onClick} onMouseDown={onMouseDown} onMouseUp={onMouseUp} className="bg-purple-700 active:bg-purple-800 text-theme-white px-4 py-2 rounded">
            {children}
        </button>
        </div>
    )
}

export default Button;