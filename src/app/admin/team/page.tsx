import { ResourceManager } from "@/components/admin/resource-manager";
import type { TeamInvitation } from "@/types/domain";

export default function TeamPage() {
  return (
    <ResourceManager<TeamInvitation>
      title="משתמשים והרשאות"
      subtitle="הזמינו גבאים ועורכים. עם התחברותם למערכת, ההרשאה מצורפת אוטומטית לבית הכנסת הזה בלבד."
      storageKey="admin:team-invitations"
      resource="team-invitations"
      initialRows={[]}
      fields={[
        { key: "email", label: "כתובת אימייל" },
        { key: "role", label: "הרשאה", type: "select", options: [
          { value: "editor", label: "עורך" },
          { value: "viewer", label: "צפייה בלבד" },
          { value: "owner", label: "בעלים" },
        ] },
      ]}
      newRow={{ email: "", role: "editor" }}
    />
  );
}
