import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

const MobileDropdown = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-[100]"
        onClick={onClose}
      />
      
      {/* Dropdown panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-[101] max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </>,
    document.body
  );
};

export default MobileDropdown;