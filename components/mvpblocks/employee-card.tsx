import Employee from "@/types/employee";
import { Shield, DollarSign, Info, Clock, Crown, Mail } from "lucide-react";

const roleIconMap = {
  admin: Shield,
  cashier: DollarSign,
  information: Info,
  pending: Clock,
  superAdmin: Crown,
};

const EmployeeCard = ({ name, role, email }: Employee) => {
  const Icon = roleIconMap[role] || Info;

  return (
    <div className="w-full max-w-md h-50 p-2">
      <div className="scale-in group visible cursor-pointer h-full">
        <div
          className={`
            relative transform overflow-hidden rounded-2xl p-6 shadow-md
            transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg
            bg-card text-card-foreground border border-border h-full flex flex-col
          `}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-primary"></div>

          <div className="relative flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>

              <h3
                className="font-sans font-semibold leading-tight truncate"
                style={{ fontSize: "clamp(0.8rem, 2.5vw, 1.125rem)" }}
              >
                {name}
              </h3>

              <p
                className="text-sm text-muted-foreground capitalize truncate"
                style={{ fontSize: "clamp(0.7rem, 2vw, 0.875rem)" }}
              >
                {role}
              </p>
            </div>

            <div className="h-px bg-border/50 my-2"></div>

            <div className="flex items-center text-muted-foreground overflow-hidden whitespace-nowrap">
              <Mail className="mr-2 h-4 w-4 text-primary/70 shrink-0" />
              <span
                className="truncate"
                style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)" }}
              >
                {email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
