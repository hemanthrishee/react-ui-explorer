
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Book, Code } from 'lucide-react';
import { UserRole } from '@/types/user';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSelector = ({ selectedRole, onRoleChange }: RoleSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Choose your role</h3>
      <RadioGroup
        value={selectedRole}
        onValueChange={(value) => onRoleChange(value as UserRole)}
        className="grid grid-cols-2 gap-4"
      >
        <div className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer ${
          selectedRole === 'student' ? 'border-primary bg-primary/5' : 'border-gray-200'
        }`}>
          <RadioGroupItem value="student" id="student" className="sr-only" />
          <Label htmlFor="student" className="cursor-pointer flex flex-col items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            <span className="font-medium text-center">Student</span>
            <p className="text-xs text-gray-500 text-center">
              Join classes and participate in coding contests
            </p>
          </Label>
        </div>
        <div className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer ${
          selectedRole === 'teacher' ? 'border-primary bg-primary/5' : 'border-gray-200'
        }`}>
          <RadioGroupItem value="teacher" id="teacher" className="sr-only" />
          <Label htmlFor="teacher" className="cursor-pointer flex flex-col items-center gap-2">
            <Code className="h-8 w-8 text-primary" />
            <span className="font-medium text-center">Teacher</span>
            <p className="text-xs text-gray-500 text-center">
              Create classes and coding contests for students
            </p>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default RoleSelector;
