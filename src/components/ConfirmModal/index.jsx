import style from "./index.module.css";

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar" 
}) {
  if (!isOpen) return null;

  return (
    <div className={style.overlay}>
      <div className={style.modal}>
        <h3 className={style.title}>{title}</h3>
        <p className={style.message}>{message}</p>
        
        <div className={style.actions}>
          <button className={style.btnCancel} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={style.btnConfirm} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
