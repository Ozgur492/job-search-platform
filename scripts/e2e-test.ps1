$ErrorActionPreference = "Stop"

$base = "http://localhost:8081/api/v1"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "=== Creating Test Company ===" -ForegroundColor Cyan
$companyBody = '{"name":"TechCorp Istanbul","website":"https://techcorp.com.tr","logoUrl":"https://example.com/logo.png"}'
$company = Invoke-RestMethod -Uri "$base/companies" -Method POST -Headers $headers -Body $companyBody
$companyId = $company.id
Write-Host "Company ID: $companyId" -ForegroundColor Green

Write-Host "`n=== Creating Test Jobs ===" -ForegroundColor Cyan

$job1Body = @"
{"companyId":"$companyId","title":"Senior Backend Developer","description":"We are looking for an experienced Java/Spring Boot developer.","country":"Turkey","city":"Istanbul","town":"Kadikoy","workPreference":"REMOTE","employmentType":"FULL_TIME","positionLevel":"SENIOR","department":"Engineering","salaryMin":50000,"salaryMax":80000,"currency":"TRY"}
"@
$job1 = Invoke-RestMethod -Uri "$base/jobs" -Method POST -Headers $headers -Body $job1Body
Write-Host "Job 1: $($job1.title) [$($job1.id)]" -ForegroundColor Green

$job2Body = @"
{"companyId":"$companyId","title":"Frontend React Developer","description":"Join our frontend team to build modern web apps with React.","country":"Turkey","city":"Istanbul","town":"Besiktas","workPreference":"HYBRID","employmentType":"FULL_TIME","positionLevel":"MID","department":"Engineering","salaryMin":40000,"salaryMax":65000,"currency":"TRY"}
"@
$job2 = Invoke-RestMethod -Uri "$base/jobs" -Method POST -Headers $headers -Body $job2Body
Write-Host "Job 2: $($job2.title) [$($job2.id)]" -ForegroundColor Green

$job3Body = @"
{"companyId":"$companyId","title":"DevOps Engineer","description":"Manage our cloud infrastructure on Azure.","country":"Turkey","city":"Ankara","town":"Cankaya","workPreference":"ONSITE","employmentType":"FULL_TIME","positionLevel":"MID","department":"Operations","salaryMin":45000,"salaryMax":70000,"currency":"TRY"}
"@
$job3 = Invoke-RestMethod -Uri "$base/jobs" -Method POST -Headers $headers -Body $job3Body
Write-Host "Job 3: $($job3.title) [$($job3.id)]" -ForegroundColor Green

$job4Body = @"
{"companyId":"$companyId","title":"Mobile Developer","description":"Build cross-platform mobile apps using React Native.","country":"Turkey","city":"Izmir","workPreference":"REMOTE","employmentType":"FULL_TIME","positionLevel":"JUNIOR","department":"Engineering","salaryMin":30000,"salaryMax":50000,"currency":"TRY"}
"@
$job4 = Invoke-RestMethod -Uri "$base/jobs" -Method POST -Headers $headers -Body $job4Body
Write-Host "Job 4: $($job4.title) [$($job4.id)]" -ForegroundColor Green

Write-Host "`n=== Fetching All Jobs ===" -ForegroundColor Cyan
$jobs = Invoke-RestMethod -Uri "$base/jobs?page=0&size=10" -Method GET
Write-Host "Total jobs: $($jobs.total)" -ForegroundColor Green
foreach ($j in $jobs.data) {
    Write-Host "  - $($j.title) | $($j.city) | $($j.workPreference)" -ForegroundColor White
}

Write-Host "`n=== Testing Job Detail ===" -ForegroundColor Cyan
$detail = Invoke-RestMethod -Uri "$base/jobs/$($job1.id)" -Method GET
Write-Host "Detail: $($detail.title) - $($detail.city) - $($detail.workPreference)" -ForegroundColor Green

Write-Host "`n=== Testing Company Detail ===" -ForegroundColor Cyan
$comp = Invoke-RestMethod -Uri "$base/companies/$companyId" -Method GET
Write-Host "Company: $($comp.name)" -ForegroundColor Green

Write-Host "`n=== Testing Application Count ===" -ForegroundColor Cyan
$count = Invoke-RestMethod -Uri "$base/jobs/$($job1.id)/applications/count" -Method GET
Write-Host "Application count: $($count.count)" -ForegroundColor Green

Write-Host "`n=== Testing Swagger/OpenAPI ===" -ForegroundColor Cyan
$docs = Invoke-RestMethod -Uri "http://localhost:8081/v3/api-docs" -Method GET
Write-Host "OpenAPI version: $($docs.openapi)" -ForegroundColor Green
Write-Host "API paths count: $($docs.paths.PSObject.Properties.Count)" -ForegroundColor Green

Write-Host "`n=== ALL BACKEND TESTS PASSED ===" -ForegroundColor Green
