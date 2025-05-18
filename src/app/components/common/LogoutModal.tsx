"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogoutModalProps } from "@/lib/interfaces";

const LogoutModal: React.FC<LogoutModalProps> = ({ open, onClose, onLogout }) => {

  const handleConfirmLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-8 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            Logout Confirmation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <p className="text-gray-600 mb-12">
            Are you sure you want to log out of your account?
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 rounded-full font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLogout}
              className="px-6 py-2 rounded-full font-semibold"
            >
              Log Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;