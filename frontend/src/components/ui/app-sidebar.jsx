import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
    
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Home, Inbox } from 'lucide-react'

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
]


const AppSidebar = () => {
  return (
     <Sidebar>
        <SidebarHeader>
            User
        </SidebarHeader>
      <SidebarContent>
         <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar