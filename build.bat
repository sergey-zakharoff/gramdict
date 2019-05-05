echo Node version:
node --version

echo .NET info:
dotnet --info

echo Restoring NuGet packages
nuget restore

echo Running build (MSBuild)...