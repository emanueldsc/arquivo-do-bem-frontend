import { InstitutionEditor } from "./InstitutionEditor";
import style from "./InstitutionModal.module.css";

export function InstitutionModal({ isOpen, onClose, institution, onSaved }) {
  if (!isOpen) return null;

  return (
    <div className={style.overlay}>
      <div className={style.modal}>
        <button className={style.closeButton} onClick={onClose}>×</button>

        <InstitutionEditor
          institution={institution} // null → criação
          onSuccess={(saved) => {
            onSaved?.(saved);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
