"use client";
import {Download, TrendingUp, Leaf, Award} from "lucide-react";

export default function ReportsPage(){
    function handleClick (e: React.MouseEvent<HTMLButtonElement>) {
        alert("[Demo Mode] Exporting participation CSV report...");
    }
    return(
        <div className="space-y-6">
            <div className ="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className ="text-2xl font-bold text-slate-900">Participation Reports & Analytics</h1>
                    <p className = "text-sm text-slate-500">Summary information of the challenges </p>
                </div>
                <button className = "px-4 p-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
                onClick = {handleClick}>
                    Export CSV
                </button>
            </div>

            <div className = "grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                    <div className = "flex flex-col">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">Total Actions Logged</span>
                            <div className={"p-2 rounded-lg text-purple-600 bg-purple-50"}>
                                <Award className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <span className="text-2xl font-bold text-slate-900">1,420</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                    <div className = "flex flex-col">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">Estimated CO2 Prevented</span>
                            <div className={"p-2 rounded-lg text-emerald-600 bg-emerald-50"}>
                                <Leaf className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <span className="text-2xl font-bold text-slate-900">384 kg</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                    <div className = "flex flex-col">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">Active Participation Rate</span>
                            <div className={"p-2 rounded-lg text-blue-600 bg-blue-50"}>
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <span className="text-2xl font-bold text-slate-900">78.4%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className = "bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                <div className="space-y-6">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                        Transportation
                        <span className="text-slate-500">42%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className = "bg-emerald-500 h-3"
                        style = {{width: "42%"}}>
                        </div>
                    </div>
                </div>
            </div>

            <div className = "bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                <div className="space-y-6">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                        Waste & Recycleing
                        <span className="text-slate-500">28%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className = "bg-blue-500 h-3"
                        style = {{width: "28%"}}>
                        </div>
                    </div>
                </div>
            </div>

            <div className = "bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                <div className="space-y-6">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                        Energy Conservation
                        <span className="text-slate-500">18%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className = "bg-amber-500 h-3"
                        style = {{width: "18%"}}>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
