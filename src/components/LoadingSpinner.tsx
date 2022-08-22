import { Spin } from "antd";

const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Spin size="large" />
    </div>
  );
};

export default LoadingSpinner;
