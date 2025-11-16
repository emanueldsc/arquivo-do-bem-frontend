import { useState } from "react";

export function TabContainer({ children }) {
  const initialTab = React.Children.toArray(children)[0]?.props.id;
  const [activeTab, setActiveTab] = useState(initialTab);

  

}
