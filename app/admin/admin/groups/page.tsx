import Link from "next/link"
import {Plus, Users, Building2} from "lucide-react"

interface Records {
    id: string;
    name: string;
    description: string;
    members: number;
    activeChallenge: string;
}
const MOCK_GROUPS: Records[] = [
    {   id: "g1",
        name: "School of Engineering",
        description: "Collection of students and faculty from the School of Engineering",
        members: 20,
        activeChallenge: "Water Challenge"
    },
    {   id: "g2",
        name: "Campus Facilities",
        description: "Collection of facilities workers participating in challenges",
        members: 12,
        activeChallenge: "Clean Air Challenge"
    },
    {   id: "g3",
        name: "Opus College of Buisness",
        description: "Collection of students and faculty from the College of Buisness",
        members: 15,
        activeChallenge: "Water Challenge"
    }
]
export default function GroupsPage(){
    return(
        <div className = "space-y-6">
            <div className = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className = "text-2xl font-bold text-slate-900">Departments & Groups</h1>
                    <p className = "text-sm text-slate-500 mt-1">View, manage, and create groups participating in challenges</p>
                </div>
                
                <Link href = {`/admin/admin/groups/new`}>
                    <button type = "button"
                    className = "px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"> 
                        <Plus className = "w-4 h-4" />
                        Create Group
                    </button>
                </Link>
            </div>

            <div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {MOCK_GROUPS.map((group) => {
                    return (
                        <div key={group.name}
                        className = "bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                            <div className = "flex items-center justify-between">
                                <span className = "text-2xl font-bold text-slate-900">{group.name}</span>
                            </div>

                            <div className = "mt-4">
                                <span className = "text-sm font-medium text-slate-500">{group.description}</span>
                            </div>

                            <div className = "mt-4">
                                <span className = "text-sm font-medium text-slate-500">{group.members}</span>
                            </div>

                            <Link href={`/admin/admin/groups/${group.id}`}
                            className = "text-slate-800 font-semibold text-sm hover:underline flex items-center">
                                Manage Department
                            </Link>  
                        </div>
                    );
                })}
            </div>
        </div>
    );
}