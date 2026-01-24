
import React from 'react';

interface UniversalLayoutProps {
  children: React.ReactNode;
  showBottomMenu: boolean;
}

export default function UniversalLayout({ children, showBottomMenu }: UniversalLayoutProps) {
  // Step 1-9 approach:
  // - For onboarding screens (showBottomMenu=false), do nothing so behavior stays identical.
  // - For dashboard+app screens (showBottomMenu=true), provide a centered "stage" container
  //   so those screens feel as tidy as the earlier flow.
  if (!showBottomMenu) return <>{children}</>;

  return (
    <div className="min-h-screen w-full bg-transparent">
      <div className="min-h-screen w-full flex justify-center">
        {/* “Sacred stage” width matches the earlier card-driven screens */}
        <div className="w-full max-w-[520px] px-4 md:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
