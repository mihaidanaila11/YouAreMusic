export interface KnobMenuOption{
    label: string;
    action?: () => void;
    mouseEnterAction?: () => void;
    mouseLeaveAction?: () => void;
}

interface KnobMenuProps {
    options: KnobMenuOption[];
}

const KnobMenu = ({ options }: KnobMenuProps) => {

    return(
            <div>
                {
                    options.map((option) => (
                        <button
                            key={option.label}
                            onClick={option.action}
                            onMouseEnter={option.mouseEnterAction}
                            onMouseLeave={option.mouseLeaveAction}
                            className="bg-gray-300 rounded p-1"
                        >
                            {option.label}
                        </button>
                    ))
                }
            </div>
    )
};

export default KnobMenu;