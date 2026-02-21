import './App.css'
import UsersPage from "./pages/UsersPage";
import MainLayout from "./layouts/MainLayout";
import SidebarMenu from "./components/SidebarMenu";
function App() {
return (
<MainLayout
sidebar={<SidebarMenu />}
content={<UsersPage />} />
)
}
export default App