echo Node version:
node --version

echo .NET info:
dotnet --info

echo Restoring NuGet packages
nuget restore

echo install webpack
cd gramdictru
npm install
cd ..

echo Running build (MSBuild)...