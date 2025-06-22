import { VscWarning } from "react-icons/vsc";

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Panel */}
            <div
                className="relative w-full max-w-md p-6 mx-4 bg-primary border border-border-color rounded-lg shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start space-x-4">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                         <VscWarning className="h-6 w-6 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold leading-6 text-text-primary" id="modal-title">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-text-secondary">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-text-primary shadow-sm ring-1 ring-inset ring-border-color hover:bg-slate-800 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;