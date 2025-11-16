export function TabContent({ id, activeTab, children }) {
  return activeTab === id ? <div className={style.tabContent}> </div> : null;
}
